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

const RuleList = forwardRef((props, ref) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    reLoad: () => {
      loadRules();
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
      props.onAddLogEntry(err.response);
    } else {
      message.error(customMessage + " Message: " + err.message);
    }
  };

  const handleSwitchOnChange = (checked, model_name) => {
    let url = `${Constsnts.API_BASE}/rules/disable/` + model_name;
    if (checked) {
      url = `${Constsnts.API_BASE}/rules/enable/` + model_name;
    }
    axios({
      url,
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        props.onAddLogEntry(response);
        loadRules();
      })
      .catch((err) =>
        errorRespHandler(
          err,
          "Internal error while switching on/off selected rule."
        )
      );
  };

  const loadRules = () => {
    const url = `${Constsnts.API_BASE}/rules`;
    setLoading(true);
    return axios({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        //props.onAddLogEntry(response.data.meta);
        return response.data.data;
      })
      .then((data) => {
        const m_data = data.map((e) => {
          return { ...e, key: e["rule-name"] };
        });
        setRules(m_data);
        setLoading(false);
      })
      .catch((err) => {
        errorRespHandler(err, "Internal error while loading rules.");
      });
  };

  useEffect(() => {
    loadRules();
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
        </div>
      ) : (
        <div>
          <Text>{text}</Text>
        </div>
      ),
  });

  const columns = [
    {
      title: "Rule Name",
      dataIndex: "rule-name",
      width: 600,
      ...getColumnSearchProps("rule-name"),
    },
    {
      title: "Salience",
      dataIndex: "salience",
      width: 200,
      sorter: {
        compare: (a, b) => a.salience - b.salience,
        multiple: 1,
      },
    },
    {
      title: "In Engine?",
      dataIndex: "active",
      width: 60,
      render: (value, row) => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={value}
          onChange={(checked, e) =>
            handleSwitchOnChange(checked, row["rule-name"])
          }
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    columnWidth: 27,
    type: "radio",
  };

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={rules}
        pagination={{
          position: ["bottomCenter"],
          defaultPageSize: 6,
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

export default RuleList;
