import type { Route } from "./+types/home";
import { Result } from "antd";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default () => {
  
  return <Result
    status="success"
    style={{
      height: '100%',
    }}
    title="Home"
    subTitle="Hello,Welcome to Home"
  />;
}
