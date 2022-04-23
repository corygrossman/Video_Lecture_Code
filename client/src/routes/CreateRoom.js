import React from "react";
import styled from "styled-components";

const buttonStyle = styled.button`
    padding: 10px;
    border-color: #3d3b40;
    border-radius: 2px;
`;

const container = styled.div`
    padding: 10px;
    border-color: #3d3b40;
    border-radius: 2px;
`;

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
        <container>
        <buttonStyle onClick={teachercreate}>Teacher Button</buttonStyle>
        <buttonStyle onClick={studentcreate}>Student Button</buttonStyle>
        </container>
        </>
    );
};

export default CreateRoom;
