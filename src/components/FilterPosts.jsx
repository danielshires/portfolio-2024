import React, { useState, useMemo } from 'react'
import FilterBar from './FilterBar.astro'
import PostCard from './Cards/PostCard.astro'

export default function FilterPosts({ posts, categories, tags }) {
    const [activeFilter, setActiveFilter] = useState('featured')

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'featured') {
            const featured = posts.filter((p: any) => p.featured)
            return featured.length > 0 ? featured : posts
        }
        if (categories.includes(activeFilter)) {
            return posts.filter((p: any) => (p.category || '').toLowerCase() === activeFilter.toLowerCase())
        }
        if (tags.includes(activeFilter)) {
            return posts.filter((p: any) => (p.tags || []).map((t: string) => t.toLowerCase()).includes(activeFilter.toLowerCase()))
        }
        return posts
    }, [activeFilter, posts, categories, tags])

    // Handler for Astro custom event
    function handleFilterChange(e: any) {
        setActiveFilter(e.detail.filter)
    }

    return (
        <>
            <FilterBar
                categories={categories}
                tags={tags}
                activeFilter={activeFilter}
                on:filterchange={handleFilterChange}
            />
            <div class='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {filteredPosts.map((post: any) => (
                    <PostCard post={post} />
                ))}
            </div>
        </>
    )
}
