export default function PostContent({post}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg">
      {/* 게시글 내용 */}
      <div className="p-4 md:p-6 whitespace-pre-line text-gray-700 leading-relaxed min-h-[200px]">
        {post.content}
      </div>
    </div>
  );
}