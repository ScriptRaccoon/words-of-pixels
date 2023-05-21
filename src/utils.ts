function random_integer(a: number, b: number): number {
	return a + Math.floor((b - a) * Math.random());
}

export function random_element<T>(list: T[]): T {
	const index = random_integer(0, list.length);
	return list[index];
}

export function load_element(element: HTMLElement): Promise<void> {
	return new Promise((resolve) => {
		element.addEventListener("load", () => resolve());
	});
}
