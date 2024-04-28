import { useState } from 'react';
import Image from 'astro/components/Image.astro';

export default function Album({ albums }) {
	return albums.map((item) => (
		<a href={`/gallery/${item.id}`} className='group transition-all mb-4 block'>
			<Image
				src={item.data.cover}
				alt={item.data.title}
				format='avif'
				width={720}
				quality='mid'
				class:list={[
					'rounded-md transition-all',
					'group-hover:shadow-lg group-hover:opacity-90',
				]}
			/>
			<div className='mt-2 text-neutral-700'>
				<strong className='font-normal'>{item.data.title}</strong>
			</div>
		</a>
	));
}
