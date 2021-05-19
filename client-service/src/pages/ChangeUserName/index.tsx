import {
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { BeepTopLeftLogo } from "../../features/BeepTopLeftLogo";
import { Container } from "../../features/Container";
import { PageComponenet } from "../../features/PageComponent";
import { selectUser, setUserNameAct } from "../../features/user/userSlice";
import * as globalStyle from "../../styles";
import CancelIcon from "@material-ui/icons/Cancel";
import { CHANGE_PROFILE_PAGE_PATH } from "../ChangeProfile";

export interface Props {}

export const CHANGE_USER_NAME_PAGE_PATH = "/setusername";

export const CreateUserName: React.FC<Props> = () => {
  const [userName, setUserName] = useState("");
  const [userError, setUserError] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      setUserName(user.userName);
    }
  }, []);

  const checkUserName = async () => {
    if (userName.length < 7) return setUserError(true);
    const url = `http://localhost:4000/auth/users/check/username/${userName}`;
    const res: Response = await fetch(url);
    if (!res.ok) return setUserError(true);
    setUserError(false);
  };

  const changeUserName = async () => {
    if (user && user.userName === userName) return history.goBack();
    if (!userError && userName.length > 7) {
      const url = `http://localhost:4000/auth/users/change/username`;
      const res = await fetch(url, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (res.ok) {
        dispatch(setUserNameAct(userName));
        const newuser = document.cookie.split("=")[1] === "true";
        if (newuser) return history.push(CHANGE_PROFILE_PAGE_PATH);
        history.goBack();
      }
    }
  };

  const handleInputChange = (e: any) => {
    setUserName(e.target.value);
    checkUserName();
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <PageComponenet duration={0.2} enter="middle" leave="left">
      <BeepTopLeftLogo />
      <div style={{ ...styles.root }}>
        <Container style={{ ...styles.container }} width="20rem" height="10rem">
          <Typography className={classes.typo} variant="h6">
            Set User Name
          </Typography>
          <TextField
            error={userError}
            className={classes.textField}
            onChange={handleInputChange}
            value={userName}
            label="User Name"
            variant="outlined"
          />
          {!userError && userName.length > 7 && (
            <Container
              style={{ textAlign: "right" }}
              width="100%"
              height="auto"
            >
              <IconButton onClick={handleCancel} aria-label="done">
                <CancelIcon />
              </IconButton>
              <IconButton onClick={changeUserName} aria-label="done">
                <DoneIcon />
              </IconButton>
            </Container>
          )}
        </Container>
      </div>
    </PageComponenet>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    textField: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
      marginBottom: "1rem",
    },
    typo: {
      marginBottom: "1rem",
    },
    iconBtn: {
      marginRight: "auto",
    },
  };
});

const styles: Record<string, React.CSSProperties> = {
  root: {
    ...globalStyle.center,
    height: "100vh",
    flexDirection: "column",
  },
  container: {
    alignItems: "center",
  },
};
