import { PageComponenet } from "../../features/PageComponent";
import { LeftHomeSide } from "../../features/LeftHomeSide";
import { RightHomeSide } from "../../features/RightHomeSide";
import { useContext, useEffect, useState } from "react";
import { BeepSocket } from "../../features/BeepSocket";
import { injectApi } from "../../features/BeepSocket/api";
import { makeStyles } from "@material-ui/core";
import { ExpandedComponenet } from "../../features/ExpandedComponenet";
import { SideBar } from "../../features/SideBar";
import { PeerContext } from "../../features/Peer";
import Peer from "peerjs";

export interface Props {}

export const HOME_PAGE_PATH = "/";

export const HomePage: React.FC<Props> = () => {
  const [connected, setConnected] = useState(false);
  const beepSocket = useContext(BeepSocket);
  const peer = useContext(PeerContext);
  const classes = useStyles();

  useEffect(() => {
    if (beepSocket) {
      injectApi(beepSocket);
      setConnected(true);
    }
    injectPeerHandlers(peer);
    if (!beepSocket) setConnected(false);
  }, [beepSocket, peer]);

  return (
    <PageComponenet enter="middle" leave="left" duration={0.3}>
      {connected ? (
        <ExpandedComponenet center>
          <div className={classes.wrapper}>
            <LeftHomeSide />
            <RightHomeSide />
            <SideBar />
          </div>
        </ExpandedComponenet>
      ) : (
        <div>loading</div>
      )}
    </PageComponenet>
  );
};

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    width: "1200px",
    maxWidth: "1200px",
    height: "100vh",
  },
});

const injectPeerHandlers = (peer: Peer) => {
  peer.on("call", (call) => {
    console.log(call.metadata);
  });
};
