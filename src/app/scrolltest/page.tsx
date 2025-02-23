"use client";
import React, { useEffect, useState } from 'react';

type Item = {
    id: number;
    name: string;
    // 필요한 다른 속성 추가
};

const InfiniteScroll = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchItems = async () => {
        setLoading(true);
        const response = await fetch(`https://api.example.com/items?page=${page}`);
        const newItems: Item[] = await response.json();
        setItems((prevItems: Item[]) => [...prevItems, ...newItems]);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [page]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
        setPage((prev) => prev + 1);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading]);

    return (
        <div>
            {items.map((item) => (
                <div key={item.id}>{item.name}</div>
            ))}
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default InfiniteScroll;
