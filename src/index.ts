import path from "node:path";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs-extra";
import ID3 from "node-id3";
import type { FailedEntry } from "./typings/generics";
import {
	fetchFromDiscogs,
	fetchFromMusicBrainz,
	fetchFromSpotify,
	fetchFromiTunes,
	getSpotifyToken,
} from "./utils/axios";
import { delay, isError } from "./utils/misc";
import {
	generateSearchVariations,
	parseFileName,
	removeArtistFromTitle,
	sanitizeText,
} from "./utils/strings";

dotenv.config();

const failedLog: FailedEntry[] = [];

async function processFolder(folderPath: string) {
	const files = await fs.readdir(folderPath);
	const mp3s = files.filter((f) => f.toLowerCase().endsWith(".mp3"));

	if (
		!process.env.DISCOGS_TOKEN ||
		!process.env.SPOTIFY_CLIENT_ID ||
		!process.env.SPOTIFY_CLIENT_SECRET
	) {
		throw new Error("Missing environment variables");
	}

	const spotifyToken = await getSpotifyToken();

	const coversDir = path.join(folderPath, "covers");
	await fs.ensureDir(coversDir);

	for (const fileName of mp3s) {
		try {
			const filePath = path.join(folderPath, fileName);
			const tags = ID3.read(filePath);
			let artist = sanitizeText(tags.artist || "");
			let title = sanitizeText(tags.title || "");

			if (!artist || !title) {
				const parsed = parseFileName(fileName);
				artist ||= sanitizeText(parsed.artist);
				title ||= sanitizeText(parsed.title);
			}

			if (!artist && title) {
				const guess = title.match(/^(.*?)(?=\s+[^\s]+$)/);
				if (guess) {
					artist = guess[1].trim();
					title = title.replace(artist, "").trim();
				}
			}

			if (artist && title) {
				title = removeArtistFromTitle(artist, title);
			}

			const variations = generateSearchVariations(artist, title);
			console.log(`🎵 ${fileName} → ${variations[0]}`);

			let coverData = null;

			if (spotifyToken) {
				console.log("🔁 Spotify...");
				coverData = await fetchFromSpotify(artist, title, spotifyToken);
			}

			if (!coverData) {
				console.log("🔁 iTunes...");
				const iTunesURL = await fetchFromiTunes(variations);

				if (iTunesURL) {
					coverData = (
						await axios.get(iTunesURL, { responseType: "arraybuffer" })
					).data;
				}
			}

			if (!coverData) {
				console.log("🔁 MusicBrainz...");
				coverData = await fetchFromMusicBrainz(artist, title);
			}

			if (!coverData) {
				console.log("🔁 Discogs...");
				coverData = await fetchFromDiscogs(artist, title);
			}

			if (coverData) {
				const coverPath = path.join(
					coversDir,
					`${path.parse(fileName).name}.jpg`,
				);
				await fs.writeFile(coverPath, coverData);

				ID3.update(
					{
						image: {
							mime: "image/jpeg",
							type: { id: 3, name: "front cover" },
							description: "",
							imageBuffer: coverData,
						},
					},
					filePath,
				);

				console.log(`✅ Copertina salvata per ${fileName}`);
			} else {
				console.log(`❌ Fallito: ${fileName}`);
				failedLog.push({ fileName, artist, title, variations });
			}

			await delay(1500);
		} catch (err) {
			if (isError(err)) {
				console.error(`Errore su ${fileName}:`, err.message);
				failedLog.push({ fileName, error: err.message });
			} else {
				console.error(`Errore su ${fileName}:`, err);
				failedLog.push({ fileName, error: err as string });
			}
		}
	}

	if (failedLog.length) {
		const out = failedLog.map((e) => JSON.stringify(e)).join("\n");
		await fs.writeFile(path.join(folderPath, "not_found.log"), out, "utf8");
		console.log(
			`! Copertine non trovate per ${failedLog.length} file. Vedi: not_found.log`,
		);
	}

	console.log(`🎉 Completato. Copertine in: ${coversDir}`);
}

const folderPath = process.argv[2];
if (!folderPath) {
	console.error("❗ Devi specificare una cartella come argomento");
	process.exit(1);
}

processFolder(folderPath);
