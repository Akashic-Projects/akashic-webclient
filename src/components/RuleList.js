import React, { useState } from "react";
import { Table, Typography } from "antd";

const { Text } = Typography;

const columns = [
  {
    title: "Rule Name",
    dataIndex: "name",
    width: 500,
    render: (text, row) => <div>{text}</div>,
  },
];

const data = [
  {
    key: "1",
    name: "Rule 1",
    group: "Group 1",
  },
  {
    key: "2",
    name: "Rule 2",
    group: "Group 2",
  },
  {
    key: "3",
    name: "Rule 3",
    group: "Group 3",
  },
  {
    key: "4",
    name: "Rule 4",
    group: "Group 4",
  },
  {
    key: "5",
    name: "Rule 5",
    group: "Group 5",
  },
];

const RuleList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    columnWidth: 27,
    onChange: () => {},
    type: "radio",
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        position: ["bottomCenter"],
      }}
      showHeader={false}
      onRow={(record) => ({
        onClick: () => {
          setSelectedRowKeys([record.key]);
        },
      })}
      rowSelection={rowSelection}
    />
  );
};

export default RuleList;
