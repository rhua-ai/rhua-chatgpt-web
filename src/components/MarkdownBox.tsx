import React from "react";
import RemarkGfm from "remark-gfm";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RehypeHighlight from "rehype-highlight";
import {CopyButton} from "./CopyButton";
import {MermaidBox} from "./MermaidBox";
import Markdown from "react-markdown";
import {MessageUtil} from "../utils/message-util";

interface MarkdownBoxProps {
  content: string;
}

const isEqual = (prevProps: MarkdownBoxProps, currentProps: MarkdownBoxProps) => {
  return prevProps.content === currentProps.content;
}

export const MarkdownBox: React.FC<MarkdownBoxProps> = React.memo(({content}) => {
  return (
    <Markdown
      remarkPlugins={[RemarkGfm, RemarkMath, RemarkBreaks]}
      rehypePlugins={[RehypeKatex, RehypeHighlight]}
      children={MessageUtil.messageContentConvert(content)}
      components={{
        a: ({href, children}) => {
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
        },
        code: ({node, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || "");
          if (match?.length) {
            const id = Math.random().toString(36).substr(2, 9);
            return (
              <div className="language-code">
                <div className="header">
                  {match[1] == 'mermaid' ? (
                    <span style={{lineHeight: '32px'}}>mermaid</span>
                  ) : (
                    <span style={{lineHeight: '32px'}}>{match[1]}</span>
                  )}
                  <CopyButton elementId={id}/>
                </div>
                {match[1] == 'mermaid' ? (
                  <div>
                    <MermaidBox elementId={id} chartContent={children as string}/>
                    <span id={id} style={{display: 'none'}}>{children}</span>
                  </div>
                ) : (
                  <div id={id} className={className}>{children}</div>
                )}
              </div>
            );
          } else {
            return (
              <code {...props} className={className}>{children}</code>
            );
          }
        }
      }}
    />
  )
}, isEqual);