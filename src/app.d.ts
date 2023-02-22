// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { ObjectId } from "mongodb";

// and what to do when importing types
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				_id?: ObjectId,
				id: string,
			}
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export { };
