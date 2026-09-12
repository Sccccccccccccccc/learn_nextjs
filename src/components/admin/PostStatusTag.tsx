/** 文章状态徽标：已发布 / 草稿 */
const PostStatusTag = ({ published }: { published: boolean }) => (
  <span className={`admin-tag ${published ? "admin-tag--success" : "admin-tag--info"}`}>
    <span className="admin-tag__dot" />
    {published ? "已发布" : "草稿"}
  </span>
);

export default PostStatusTag;
