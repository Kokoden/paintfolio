import * as React from "react";
import { Link, HeadFC, PageProps } from "gatsby";

const NotFoundPage: React.FC<PageProps> = () => {
  return <div>bye.</div>;
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Not found</title>;
