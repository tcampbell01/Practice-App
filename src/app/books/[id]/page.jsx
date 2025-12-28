import BookDetailPage from "@/components/books/BookDetailPage";

export default function Page({ params }) {
  return <BookDetailPage bookId={params.id} />;
}

