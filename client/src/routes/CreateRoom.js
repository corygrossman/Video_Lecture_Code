import React from "react";
import styled from "styled-components";

const But = styled.button`
    padding: 30px;
    border-color: #FFFFFF;
    color: #FFFFFF;
    border: 2px;
    border-radius: 2px;
`;

const Container = styled.div`
    display: flex;
    margin: auto;
    flex-wrap: wrap;
    background-color: #3d3b40;
    align-items: center;
`;

//sets a demo homepage
const CreateRoom = (props) => {
    //navigates to the teacher view
    function teachercreate() {
        const id = 'introtoswe'
        props.history.push(`/courses/${id}/video/?isTeacher=true`);
    }
    //navigates to the student view
    function studentcreate() {
        const id = 'introtoswe/'
        props.history.push(`/courses/${id}/video`);
    }

    return (
        <>
        <Container>
        <But onClick={teachercreate}>Teacher Button</But>
        <But onClick={studentcreate}>Student Button</But>
        </Container>
        </>
    );
};

export default CreateRoom;
