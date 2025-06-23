import { defineCollection, reference, z } from 'astro:content';

const albums = defineCollection({
	type: 'data',
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			cover: image(),
			date: z.date(),
			draft: z.boolean(),
			images: z.array(
				z.object({
					image: image(),
					caption: z.string().optional(),
					alt: z.string(),
				}),
			),
			tags: z.array(reference('tags')).optional(),
		}),
});

const tags = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
	}),
});

const posts = defineCollection({
	type: 'content',
	schema: ({ image }) =>
		z.object({
			title: z
				.string()
				.max(160, { message: 'Title must be 160 characters or less' }),
			description: z
				.string()
				.max(160, { message: 'Title must be 160 characters or less' }),
			date: z.date(),
			tags: z.array(z.string()),
			relatedPosts: z.array(reference('posts')).optional(),
			author: reference('team').optional(),
			albums: reference('albums').optional(),
			cover: image().optional(),
		}),
});

const team = defineCollection({
	type: 'data',
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			bio: z.string(),
			email: z.string().email(),
			role: z.enum(['photographer', 'writer', 'editor']),
			headshot: image(),
		}),
});

const services = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		contact: reference('team'),
		available: z.boolean(),
		tags: z.array(z.string()),
	}),
});

export const collections = {
	albums,
	posts,
	team,
	tags
};
