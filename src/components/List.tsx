import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const List: FC<Props> = ({ children }) => (
  <ul className="grid w-full gap-2 overflow-y-auto">{children}</ul>
);

export default List;
