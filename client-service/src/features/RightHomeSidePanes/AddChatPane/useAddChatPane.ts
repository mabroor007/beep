import { useContext, useState } from "react";
import { jsonReq } from "../../JSON";
import { TUser } from "../../user/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { goToNewChatPane } from "../paneSlice";
import { uploadFileAction } from "../../FileUpload/uploadSlice";
import { selectUser } from "../../user/userSlice";
import { BeepSocket } from "../../BeepSocket";
import { O } from "../../O";

export const useAddChatPane = () => {
  const dispatch = useAppDispatch();
  const beepSocket = useContext(BeepSocket);
  const [chatname, setChatName] = useState("");
  const [image, setImage] = useState("http://picsum.photos/400/400");
  const [blobImage, setBlobImage] = useState<Blob>(new Blob());
  const [userResults, setUserResults] = useState<TUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const user = useAppSelector(selectUser);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const userName = e.target.value;
    if (userName.length < 7) return;
    const response = await searchUsersWithUserName(userName);
    if (response.ok) {
      const { payload } = await response.json();
      setUserResults(payload.users as TUser[]);
    }
  };

  const searchUsersWithUserName = async (userName: string) => {
    return jsonReq(
      `http://localhost:4000/auth/users/find/username/${userName}`,
      "get",
      null
    );
  };

  const onAddMemberHandler = (member: TUser) => {
    if (user && member.id === user.id) return setUserResults([]);
    for (let suser of selectedUsers) {
      if (suser.id === member.id) {
        return setUserResults(
          userResults.filter((user) => user.id !== member.id)
        );
      }
    }
    setSelectedUsers([...selectedUsers, member]);
    setUserResults([]);
  };

  const handleDeleteSelected = (user: TUser) => {
    setSelectedUsers(selectedUsers.filter((suser) => suser.id === user.id));
    console.log(selectedUsers);
  };

  const createChat = async () => {
    if (!user) {
      dispatch(goToNewChatPane());
    } else {
      dispatch(
        uploadFileAction("chat-picture", blobImage, async (picture) => {
          try {
            const chat = await PromisedSocketCall(O.CREATE_CHAT, {
              ownerId: user.id,
              name: chatname,
              picture,
            });
            if (chat.id) {
              console.log("from useAddChat/createChat", chat);
              addMembersToChat(chat, (res) => console.log(res));
            }
          } catch (e) {
            console.log(e);
          }
        })
      );
    }
  };

  const addMembersToChat = (chat: any, onMemberAdded: (res: any) => void) => {
    let currentMember = 0;
    PromisedSocketCall(O.ADD_MEMBER_TO_CHAT, {
      chatId: chat.id,
      memberId: selectedUsers[0].id,
    })
      .then((res) => {
        onMemberAdded(res);
        const nextUser = selectedUsers[currentMember + 1];
        if (nextUser) {
          const nextMemberId = nextUser.id;
          return PromisedSocketCall(O.ADD_MEMBER_TO_CHAT, {
            chatId: chat.id,
            memberId: nextMemberId,
          });
        } else {
          return;
        }
      })
      .catch((e) => console.log(e));
  };

  const PromisedSocketCall = async (
    CODE: string,
    params: any
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (beepSocket) {
        beepSocket.emit(CODE, params, (response: any) => {
          if (response === false) {
            reject(false);
          } else {
            resolve(response);
          }
        });
      } else {
        reject(false);
      }
    });
  };

  const handleDoneBtn = () => {
    createChat();
  };

  const handleCancelBtn = () => {
    dispatch(goToNewChatPane());
  };

  return {
    image,
    setBlobImage,
    chatname,
    setChatName,
    selectedUsers,
    handleSearch,
    userResults,
    handleCancelBtn,
    handleDoneBtn,
    handleDeleteSelected,
    setImage,
    onAddMemberHandler,
  };
};