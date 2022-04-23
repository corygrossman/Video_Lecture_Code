import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { useNavigate, useParams } from 'react-router-dom';

//checks to see if the user is a teacher
let isTeacher = false;
const URL = new URLSearchParams(window.location.search).get("isTeacher");
  console.log("url", URL);
  if (URL) {
    isTeacher = true;
  } else {
    isTeacher =false;
  }

  //sets up the styles for the returned html elements
const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    margin: auto;
    flex-wrap: wrap;
    background-color: #3d3b40;
    color: #3d3b40;
    align-items: center;
`;

const LeftContainer = styled.div`
    float: left;
    width: 80%;
    
`;
const RightContainer = styled.div`
    float: left;
    width: 20%;
`;

const StyledVideo = styled.video`
    height: 100%;
    width: 80%;
    margin: auto;
    color: #3d3b40;
    border: 10px;
    border-color: #eaf5f1;
    border-radius: 20px;
`;

const StyledTeacherVideo = styled.video`
    padding: 20px;
    height: 100%;
    width: 90%;
    color: #3d3b40;
    border: 20px;
    border-color: #eaf5f1;
    border-radius: 20px;
    margin: auto;
`;

//returns a student video
const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        console.log("inside of video useEffect");
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}

//returns a teacher video
const TeacherVideo = (props) => {
    const ref = useRef();

    useEffect(() => {
        console.log("inside of video useEffect");
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledTeacherVideo playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {

    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const courseCode = useParams();


    useEffect(() => {

        //connects to the backend server via calling the socket from a room
        socketRef.current = io.connect('http://localhost:8000');
        console.log(courseCode.courseCode);
        
        //once the media is retrieved
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            //sets the users source as video and audio
            userVideo.current.srcObject = stream;

            //emits to the server that the user is connecting to the room "courseCode"
            socketRef.current.emit("join room", courseCode.courseCode);

            //for anyone that is already in the room, adds all of the peers to a peer array 
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    });
                    peers.push(peer);
                });
                setPeers(peers);
            });

            //adds a peer to the peer array if a user joins in the middle of a lecture
            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                setPeers(users => [...users, peer]);
            });

            //retrieves signal
            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            //currently working on updating the html when a user disconnects, so that a black video box gets deleted

            // socketRef.current.on("user disconnected", id => {
            //     console.log(id);
            //     const index = peers.length-1;
            //     for(let i = 0; i < peers.length; i++){
            //         if(peers.at(i).userID == id){
            //             index = i;
            //         }
            //     }
            //     if (index !== -1) return peers.splice(index, 1)[0];
            // });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        //emits an answer back to a peer
        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        });

        peer.signal(incomingSignal);

        return peer;
    }

    //teacher view
    if(isTeacher){
        return (
            <Container>
                <LeftContainer>
                    <StyledTeacherVideo muted ref={userVideo} autoPlay playsInline />
                </LeftContainer>
                <RightContainer>
                    {peers.map((peer, index) => {
                            return (
                                <Video key={index} peer={peer} />
                            );
                        })}
                </RightContainer>
            </Container>
        );
    }
    //student view
    else{
        return (
            <Container>
                <LeftContainer>
                    {peers.map((peer, index) => {
                        //the teacher is the peer at index 0
                        if(index == 0){
                            console.log(index);
                            return (
                                <TeacherVideo key={index} peer={peer} />
                            );
                        }
                        })}
                </LeftContainer>
                <RightContainer>
                    <StyledVideo muted ref={userVideo} autoPlay playsInline />
                    {peers.map((peer, index) => {
                        //the teacher is the peer at index 0
                        if(index > 0){
                            console.log(index);
                            return (
                                <Video key={index} peer={peer} />
                            );
                        }
                        })}
                </RightContainer>
            </Container>
        );
    }
};

export default Room;