import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import { Table, Input, Space, Button, Spin, message, Typography } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

import Constsnts from "../constants/networking";

const { Text } = Typography;

const AssistanceModal = (props, ref) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFacts(props.data);
    setLoading(false);
  }, [props.data]);

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
    render: (text, row) =>
      searchedColumn === dataIndex ? (
        <div>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        </div>
      ) : (
        <div>
          <Text>{text}</Text>
        </div>
      ),
  });

  const columns = [
    {
      title: "Value",
      dataIndex: "value",
      width: 600,
      ...getColumnSearchProps("value"),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    columnWidth: 27,
    onChange: () => {},
    type: "radio",
  };

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={facts}
        pagination={{
          position: ["bottomCenter"],
          defaultPageSize: 5,
        }}
        showHeader={true}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKeys([record.key]);
            props.onSelectionChange(record);
          },
        })}
        rowSelection={rowSelection}
      />
    </Spin>
  );
};

export default AssistanceModal;
