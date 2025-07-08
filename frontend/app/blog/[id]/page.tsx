import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

// Static params generation for export
export async function generateStaticParams(): Promise<{ id: string }[]> {
  // For static export, we provide some common blog IDs
  // These will be generated as static pages, others will fallback to client-side routing
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'example' },
    { id: 'test' }
  ];
}

// Metadata generation
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: 'Blog Detayı | Kardiyolive',
    description: 'Blog yazısı detayları'
  };
}

export default function BlogDetail({ params }: { params: { id: string } }) {
  return <BlogDetailClient id={params.id} />;
}