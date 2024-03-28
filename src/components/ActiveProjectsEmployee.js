import React, { useState, useEffect } from "react";
import ModalPopUp from "./ModalPopUp.js";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import { Table } from "react-bootstrap";

function ActiveProjectsEmployee() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeProjects, setActiveProjects] = useState(null);
  const [openState, setOpenState] = useState(false);

  useEffect(() => {
    const storedUserID = JSON.parse(localStorage.getItem("userID"));

    async function fetchUsername() {
      try {
        const response = await axios.get(
          "http://localhost:4000/usernameAndRole"
        );
        if (response.status === 200) {
          const userData = response.data;
          setCurrentUser(userData.userName);
        } else {
          console.log("Failed to fetch user name");
        }
      } catch (error) {
        console.log("Error fetching user name: ", error);
      }
    }
    fetchUsername();

    async function getActiveProjects() {
      try {
        const response = await axios.post(
          "http://localhost:8000/ActiveProjects",
          { storedUserID }
        );
        setActiveProjects(response.data.results);
      } catch (error) {
        console.log(error);
      }
    }

    getActiveProjects();
  }, []);

  const toggleOpen = (id) => {
    setOpenState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const hasTimeReports = (data) => {
    //checks if there is any timereports for the project
    return data.timereports && data.timereports.length > 0;
  };

  if (!activeProjects) {
    return <p>Det finns inga aktiva projekt för {currentUser} just nu</p>;
  }

  return (
    <div className="Data">
      <h1 className="Projects-h1">Aktiva projekt för {currentUser}</h1>
      <br />

      {activeProjects.map((data) => {
        return (
          <div key={data.id}>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h2 className="card-title">
                      {data.properties.Projectname.title[0]?.plain_text}
                    </h2>
                  </div>
                  <div className="modalbtn col-md-3 text-end mt-1">
                    <ModalPopUp data={data}></ModalPopUp>
                  </div>
                  <div className="col-md-3 text-end mt-1">
                    <Button
                      className="btn pb-0"
                      onClick={() => toggleOpen(data.id)}
                      aria-controls="example-collapse-text"
                      aria-expanded={openState[data.id]}
                    >
                      {openState[data.id] ? (
                        <p className="p-0 mb-2 mt-0">Stäng tidsrapporter</p>
                      ) : (
                        <p className="p-0 mb-2 mt-0">Se tidsrapporter</p>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="row">
                  <div className="date-container col-md-3">
                    <h6>Startdatum</h6>
                    <p className="date">
                      {data.properties.Timespan.date.start}
                    </p>
                  </div>
                  <div className="date-container col-md-3">
                    <h6>Planerat slutdatum</h6>
                    <p className="date">{data.properties.Timespan.date.end}</p>
                  </div>

                  <div className="collapse-container col-md-6">
                    <div className=" text-center">
                      <Collapse in={openState[data.id]}>
                        <div className="table-container">
                          <Table
                            striped
                            bordered
                            hover
                          >
                            <thead>
                              <tr>
                                <th>Datum</th>
                                <th>Arbetade timmar</th>
                                <th>Kommentar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {hasTimeReports(data) ? (
                                data.timereports.map((report) => (
                                  <tr key={report.id}>
                                    <td>{report.properties.Date.date.start}</td>
                                    <td className="text-center">
                                      {report.properties.Hours.number}
                                    </td>
                                    <td>
                                      {
                                        report.properties.Note.title[0]
                                          ?.plain_text
                                      }
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3">
                                    <p className="mt-3 bg-light border text-center p-1">
                                      Det finns inga rapporterade tider för det
                                      här projektet
                                    </p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />
          </div>
        );
      })}
    </div>
  );
}

export default ActiveProjectsEmployee;
