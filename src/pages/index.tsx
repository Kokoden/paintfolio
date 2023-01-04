import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import Painter from "../utils/Painter";

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <Painter lineWidth={3} threshold={4} recordPoints={true} />
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
