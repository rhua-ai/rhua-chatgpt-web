import {IconCopyStroked, IconDownCircleStroked} from "@douyinfe/semi-icons";
import React, {useState} from "react";
import {Button, Toast, Tooltip} from "@douyinfe/semi-ui";

interface CopyButtonProps {
  elementId: string;
}

const copyEquip = (prevProps: CopyButtonProps, currentProps: CopyButtonProps) => {
  return prevProps.elementId === currentProps.elementId;
}

export const CopyButton: React.FC<CopyButtonProps> = React.memo((
  {
    elementId
  }
) => {
  const [copied, setCopited] = useState<boolean>(false);

  const onCopy = async () => {
    try {
      setCopited(true);
      const codeBox = document.getElementById(elementId);
      if (codeBox != null) {
        const text = codeBox.innerText;
        await navigator.clipboard.writeText(text);
        Toast.success({
          content: "复制成功",
          showClose: false,
          duration: 1
        });
      }
    } catch (error) {
      console.log(error);
      Toast.error({
        content: "复制失败",
        showClose: false,
        duration: 1
      });
    }
  };

  const onMouseLeave = () => {
    setCopited(false);
  }

  return (
    <Tooltip content="复制">
      <Button
        theme="borderless"
        type="tertiary"
        icon={!copied ? <IconCopyStroked /> : <IconDownCircleStroked style={{color: "var(--semi-color-success)"}} />}
        aria-label="复制"
        onClick={onCopy}
        onMouseLeave={onMouseLeave}
      />
    </Tooltip>
  )
}, copyEquip);