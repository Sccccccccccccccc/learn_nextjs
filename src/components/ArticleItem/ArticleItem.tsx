import Link from "next/link";

import styles from "./ArticleItem.module.css";
import { CommentIcon, EyeIcon } from "./icons";

/** 列表项数据。字段对齐 douLog 的 IArticleListItem，用不到的可以不传。 */
export type ArticleItemData = {
  id: string | number;
  title: string;
  excerpt?: string | null;
  /** 展示用字符串（douLog 用的是 WP 的 post_date） */
  date?: string | null;
  tags?: string[];
  viewCount?: number | null;
  commentCount?: number | null;
  image?: string | null;
};

type Props = {
  article: ArticleItemData;
};

const ArticleItem = ({ article }: Props) => {
  const { id, title, excerpt, date, tags = [], viewCount, commentCount, image } = article;

  return (
    <Link className={styles.item} href={`/blog/${id}`}>
      <div className={styles.left}>
        <h3 className={styles.title}>{title}</h3>

        {/* 元信息：日期 / 首个标签 / 浏览量 / 评论数 —— 有值才渲染 */}
        <div className={styles.details}>
          {date ? <div className={styles.detailItem}>{date}</div> : null}

          {tags.length > 0 ? (
            <div className={styles.detailItem}>
              {/* douLog 只显示第一个标签（tags.slice(0, 1)） */}
              <span className={styles.tagItem}>#{tags[0]}</span>
            </div>
          ) : null}

          {typeof viewCount === "number" ? (
            <div className={styles.detailItem}>
              <EyeIcon />
              <span>{viewCount}</span>
            </div>
          ) : null}

          {typeof commentCount === "number" ? (
            <div className={styles.detailItem}>
              <CommentIcon />
              <span>{commentCount}</span>
            </div>
          ) : null}
        </div>

        {excerpt ? <div className={styles.summary}>{excerpt}</div> : null}
      </div>

      {image ? (
        <div className={styles.right}>
          {/* 封面是装饰性的（标题已在旁边），所以 alt=""；
              换成真实图片 URL 后可改用 next/image（远程域名记得配 next.config） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" />
        </div>
      ) : null}
    </Link>
  );
};

export default ArticleItem;
