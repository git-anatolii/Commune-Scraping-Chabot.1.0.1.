"use client";
import { RootState } from "@/store";
import { Message, setMessages } from "@/store/slice/msgSlice";
import { Button, Image, Input, message } from "antd";
import axios from "axios";
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  ReactPortal,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

const { TextArea } = Input;

export default function Page() {
  const [text, setText] = useState<string>("");
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.message.messages);

  // Create a ref for the bottom of the message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the message container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages change
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      setText("");
    }
  };

  const sendMessage = async () => {
    const newMessage: Message = {
      text,
      links: [{ description: "", url: "" }],
      isUser: true,
    };

    // Assuming setMessages is an action creator function
    dispatch(setMessages(newMessage));
    setText("");

    try {
      const response = await axios.get(
        `http://135.181.241.163/api/chat?user_message=${text}`
      );

      if (!response.data.error) {
        if (typeof response.data === "string") {
          const [mainContent, ...seeMoreLinks] =
            response.data.split("See more:");
          const newResMessage: Message = {
            text:
              response.data.length === 0
                ? "Sorry, As an AI, I can't answer your questions."
                : mainContent,
            links: seeMoreLinks.map((link) => {
              const [description, url] = link.trim().split(" ");
              return { description, url };
            }),
            isUser: false,
          };

          // Dispatching the action after receiving the response
          dispatch(setMessages(newResMessage));
        } else {
          message.error(response.data.error)
        }
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col justify-between w-[60%] mx-auto h-screen">
      <div className="flex-1 relative w-[90%] mb-6 pt-20 overflow-hidden overflow-y-auto mx-auto dark:text-white">
        <div className="w-full p-6 text-xl">
          {messages.map(
            (
              message: {
                isUser: any;
                text:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<any, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<AwaitedReactNode>
                  | null
                  | undefined;
                links: any[];
              },
              index: Key | null | undefined
            ) => (
              <div key={index} className="py-2">
                <div>
                  {message.isUser ? (
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex">
                        <Image
                          width={40}
                          alt="chatbotlogo"
                          className="text-white rounded-full"
                          src="https://i.pinimg.com/564x/3c/73/ee/3c73ee8caf56fcc08bd11d595dca167d.jpg"
                        />
                      </div>
                      <div className="flex font-bold">You</div>
                    </div>
                  ) : (
                    <Image
                      width={50}
                      alt="chatbotlogo"
                      className="text-white"
                      src="https://lirp.cdn-website.com/df735c7c/dms3rep/multi/opt/MicrosoftTeams-image+%28123%29-1920w.png"
                    />
                  )}

                  <div className="ml-10 overflow-x-auto">{message.text}</div>

                  {message.links && message.links.length > 0 && (
                    <div className="ml-10">
                      {message.isUser ? (
                        ""
                      ) : (
                        <h2 className="mt-2">See more:</h2>
                      )}
                      {message.links.map((link, idx) => (
                        <div key={idx}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.description}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex w-[90%] mx-auto gap-2 mb-5 ">
        <TextArea
          key="bordered"
          rows={1}
          placeholder="Enter your description"
          className="pl-5 text-xl p-2 rounded-3xl"
          value={text}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) =>
            handleKeyPress(e)
          }
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setText(e.target.value)
          }
          autoFocus
        />
        <Button
          color="primary"
          size="large"
          style={{ height: "55px" }}
          onClick={() => sendMessage()}
          disabled={text ? false : true}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M2.925 5.025L9.18333 7.70833L2.91667 6.875L2.925 5.025ZM9.175 12.2917L2.91667 14.975V13.125L9.175 12.2917ZM1.25833 2.5L1.25 8.33333L13.75 10L1.25 11.6667L1.25833 17.5L18.75 10L1.25833 2.5Z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
