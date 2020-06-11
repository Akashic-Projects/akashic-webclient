import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import {
  Table,
  Input,
  Space,
  Button,
  Switch,
  Spin,
  message,
  Typography,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

import Constsnts from "../constants/networking";

const { Text } = Typography;

const DSDList = forwardRef((props, ref) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const [dsds, setDSDs] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    reLoad: () => {
      loadDSDs();
    },
  }));

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const errorRespHandler = (err, customMessage) => {
    if (typeof err.response !== "undefined" && err.response.status === 400) {
      console.log(err.response);
      props.onAddLogEntry(err.response);
    } else {
      message.error(customMessage + " Message: " + err.message);
    }
  };

  const loadDSDs = () => {
    const url = `${Constsnts.API_BASE}/dsds`;
    setLoading(true);
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        //props.onAddLogEntry(response);
        return response.data.data;
      })
      .then((data) => {
        const m_data = data.map((e) => {
          return { ...e, key: e["dsd-name"] };
        });
        setDSDs(m_data);
        setLoading(false);
      })
      .catch((err) => {
        errorRespHandler(err, "Internal error while loading DSDs.");
      });
  };

  useEffect(() => {
    loadDSDs();
  }, []);

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
          <br />
          <Text style={{ color: "black", fontSize: 12 }}>
            Unique DSD model name: {row["model-name"]}
          </Text>
        </div>
      ) : (
        <div>
          <Text>{text}</Text>
          <br />
          <Text style={{ color: "black", fontSize: 12 }}>
            Unique DSD model name: {row["model-name"]}
          </Text>
        </div>
      ),
  });

  const columns = [
    {
      title: "DSD name",
      dataIndex: "dsd-name",
      width: 600,
      ...getColumnSearchProps("dsd-name"),
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
        dataSource={dsds}
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
});

export default DSDList;
