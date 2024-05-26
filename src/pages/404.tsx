import {
  IllustrationNotFound,
  IllustrationNotFoundDark
} from "@douyinfe/semi-illustrations";
import {Button, Empty} from "@douyinfe/semi-ui";
import {useNavigate} from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const backChat = () => {
    navigate("/comment");
  }

  return (
    <Empty
      image={<IllustrationNotFound style={{ width: 150, height: 150 }} />}
      darkModeImage={<IllustrationNotFoundDark style={{ width: 150, height: 150 }} />}
      description={'哦豁，要访问的页面不存在！'}
      style={{padding: 20, textAlign: "center"}}
    >
      <Button
          type="primary"
          theme="solid"
          onClick={backChat}
      >返回聊天页面</Button>
    </Empty>
  );
}

export default NotFound;