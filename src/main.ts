import "./style.css";
import { PIXEL_COUNT, IMAGES, LIGHTNESS_THRESHOLD } from "./config";
import { load_element, random_element } from "./utils";

let image_index: number = 0;
const pixels: HTMLElement[] = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
	const scene = document.querySelector(".scene") as HTMLElement;
	create_label(scene);

	for (let i = 0; i < PIXEL_COUNT; i++) {
		create_pixel(scene);
	}

	display_next_image();
	setInterval(display_next_image, 6000);
}

function create_label(scene: HTMLElement) {
	const LABEL = IMAGES.map((src) => src.split(".")[0]).join(", ");
	const label = document.createElement("div");
	label.className = "visually-hidden";
	label.innerText = LABEL;
	scene.appendChild(label);
}

function create_pixel(scene: HTMLElement) {
	const pixel = document.createElement("div");
	pixel.className = "pixel";
	const x = window.innerWidth / 2;
	const y = window.innerHeight / 2;
	pixel.style.transform = `translate(${x}px,${y}px)`;
	scene.appendChild(pixel);
	pixels.push(pixel);
}

async function display_next_image() {
	await display_image(IMAGES[image_index]);
	image_index++;
	if (image_index >= IMAGES.length) image_index = 0;
}

async function display_image(image_source: string) {
	const coordinates = await get_light_coordinates(image_source);
	for (let index = 0; index < pixels.length; index++) {
		update_pixel(index, coordinates);
	}
}

function update_pixel(
	index: number,
	coordinates: [number, number][]
) {
	const element = pixels[index];
	const [x, y] = random_element(coordinates);
	const delay = Math.round(index * 1.5);

	setTimeout(() => {
		element.style.transform = `translate(${x}px,${y}px)`;
	}, delay);
}

async function get_light_coordinates(
	image_source: string
): Promise<[number, number][]> {
	const { data, width, height } = await get_image_data(
		image_source
	);

	const x_scale = window.innerWidth / width;
	const y_offset = window.innerHeight / 2 - x_scale * 0.5 * height;

	const coordinates: [number, number][] = [];

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			const index = 4 * (y * width + x);
			if (!is_light(index, data)) continue;
			coordinates.push([x * x_scale, y * x_scale + y_offset]);
		}
	}

	return coordinates;
}

async function get_image_data(image_source: string): Promise<{
	data: Uint8ClampedArray;
	width: number;
	height: number;
}> {
	const img = new Image();
	img.src = image_source;

	await load_element(img);
	const { width, height } = img;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(img, 0, 0);

	const { data } = ctx.getImageData(0, 0, width, height);
	return { data, width, height };
}

function is_light(index: number, data: Uint8ClampedArray) {
	const [red, green, blue] = data.slice(index, index + 3);
	return (
		red > LIGHTNESS_THRESHOLD &&
		green > LIGHTNESS_THRESHOLD &&
		blue > LIGHTNESS_THRESHOLD
	);
}
