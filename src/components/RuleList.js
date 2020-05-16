import React, { useState } from "react";
import { Table, Input, Space, Button, Switch } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

const data = [
  {
    key: 1,
    name: "Prvo pravilo",
    active: true,
    rule: {
      "rule-name": "Prvo pravilo",
      salience: 200,
    },
  },
  {
    key: 2,
    name: "Drugo pravilo",
    active: true,
    rule: {
      "rule-name": "Drugo pravilo",
      salience: 300,
    },
  },
  {
    key: 3,
    name: "Trece pravilo",
    active: false,
    rule: {
      "rule-name": "Trece pravilo",
      salience: 400,
    },
  },
];

const RuleList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Rule Name",
      dataIndex: "name",
      width: 600,
      // render: (rule, row) => {
      //   console.log("hello");
      //   return <div>{"hesto"}</div>;
      // },
      //...getColumnSearchProps("name"),
    },
    {
      title: "Activity",
      dataIndex: "active",
      width: 60,
      render: (value, row) => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={value}
        />
      ),
    },
  ];

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
        defaultPageSize: 7,
      }}
      showHeader={true}
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
