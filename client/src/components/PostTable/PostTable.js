import React from "react";
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

class PostTable extends React.Component {
  render() {
    //console.log(this.props.arr)
    return (
      <div>
        <ReactTable
          data={this.props.arr}
          
          columns={[
            {
              Header: "Info",
              columns: [
                {
                  Header: "Rank",
                  accessor: "rank"
                },
                {
                  Header: "Name",
                  accessor: "name"
                }
              ]
            },
            {
              Header: "Price",
              columns: [
                {
                  Header: "USD",
                  accessor: "quotes.USD.price"
                }
              ]
            }
          ]}
          defaultSorted={[
            {
              id: "id",
              desc: false
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
          getTrProps={(state, rowInfo, column, instance) => ({
            onClick: e => {
              this.props.clicked(rowInfo.original.id);
              console.log(rowInfo.original.id)}
          })}
          trStyleCallback={ rowInfo => ( {color: rowInfo.row.status ? 'green' : 'red'} ) }
        />
        <br />
      </div>
    );
  }
}
export default PostTable;