import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DataTable from "react-data-table-component";

const apiUrl = process.env.REACT_APP_API_URL;
function Attendence() {
  const [attendence, setAttendence] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({
    employee_id: undefined,
    start_date: new Date(),
    end_date: new Date(),
  });

  async function getEmployees() {
    try {
      const response = await axios.get(`${apiUrl}/get_all_agent`);
      setEmployees(response.data.agent);
    } catch (error) {
      console.log("error", error);
    }
  }

  async function getAttendence() {
    const id = localStorage.getItem("user_id");
    const response = await axios.get(
      `${apiUrl}/getAttendenceByApproval?user_id=${id}&start_date=${filter.start_date}&end_date=${filter.end_date}&employee_id=${filter.employee_id}`
    );
    console.log("attendence", response.data);
    setAttendence(response.data.attendences);
  }
  async function approved(_id) {
    try {
      const response = await axios.put(`${apiUrl}/make_approved`, {
        _id,
        is_approved: true,
      });
      getAttendence();
      console.log(response.data);
    } catch (error) {
      console.log("error", error);
    }
  }
  async function rejected(_id) {
    try {
      const response = await axios.put(`${apiUrl}/make_approved`, {
        _id,
        is_approved: false,
      });
      getAttendence();
      console.log(response.data);
    } catch (error) {
      console.log("error", error);
    }
  }

  // Name</th>
  //                   <th>Number</th>
  //                   <th>Entry Time</th>
  //                   <th>Exit Time</th>
  //                   <th>Status</th>
  //                   <th>Action</th>

  const attendenceColumns = [
    {
      name: "Name",

      selector: (row) => row?.user_id.agent_name,
      sortable: true,
    },
    {
      name: "Number",
      selector: (row) => row?.user_id.agent_mobile,
    },

    {
      name: "Entry time",
      selector: (row) => moment(row?.entry_time).format("MMMM Do YYYY, h:mm A"),
      sortable: true,
    },
    {
      name: "Exit time",
      selector: (row) => moment(row?.exit_time).format("MMMM Do YYYY, h:mm A"),
    },
    {
      name: "Status",

      selector: (row) => (row.is_approved ? "present" : "absent"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button
            className="btn btn-success"
            onClick={() => {
              approved(row._id);
            }}
            style={{ backgroundColor: "green" }}
          >
            approved
          </button>{" "}
          <button
            className="btn btn-danger"
            onClick={() => {
              rejected(row._id);
            }}
          >
            reject
          </button>
        </div>
      ),
      selector: (row) => (row.is_approved ? "present" : "absent"),
    },
  ];

  const exportToExcel = () => {
    const columnsForExport = attendenceColumns.map((column) => ({
      title: column.name,
      dataIndex: column.selector,
    }));

    const dataForExport = attendence.map((row) =>
      attendenceColumns.map((column) => {
        if (column.selector && typeof column.selector === "function") {
          return column.selector(row);
        }
        return row[column.selector];
      })
    );

    const exportData = [
      columnsForExport.map((col) => col.title),
      ...dataForExport,
    ];

    const blob = new Blob(
      [exportData.map((row) => row.join("\t")).join("\n")],
      {
        type: "application/vnd.ms-excel",
      }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "attendence-table.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    getAttendence();
    getEmployees();
  }, []);
  return (
    <>
      <div className="content-wrapper">
        <section className="content">
          <div className="container pl-0">
            <div className="panel-body  pr-0">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-primary" onClick={getAttendence}>
                  Refresh
                </button>

                <button
                  className="btn btn-primary"
                  onClick={exportToExcel}
                  style={{ backgroundColor: "black" }}
                >
                  Export To Excel
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label>Employee</label>
                <select
                  className="form-control"
                  style={{ width: 300, margin: 10 }}
                  onChange={(e) => {
                    setFilter((p) => ({ ...p, employee_id: e.target.value }));
                  }}
                >
                  <option value={undefined}>select employee</option>
                  {employees &&
                    employees.map((v) => {
                      return <option value={v._id}>{v.agent_name}</option>;
                    })}
                </select>
                <label>Start date</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 300, margin: 10 }}
                  onChange={(e) => {
                    setFilter((p) => ({ ...p, start_date: e.target.value }));
                  }}
                />
                <label>End date</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 300, margin: 10 }}
                  onChange={(e) => {
                    setFilter((p) => ({ ...p, end_date: e.target.value }));
                  }}
                />
                <button
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    margin: 10,
                  }}
                  className="btn"
                  onClick={getAttendence}
                >
                  Filter
                </button>
              </div>
              <DataTable
                responsive
                id="table-to-export"
                columns={attendenceColumns}
                data={attendence}
                pagination
                fixedHeader
                fixedHeaderScrollHeight="550px"
                selectableRows
                selectableRowsHighlight
                highlightOnHover
                subHeader
                // customStyles={customStyles}
                // selectedRows={selectedRowIds}
                // onSelectedRowsChange={handleSelectedRowsChange}
                striped
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
export default Attendence;
