/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Core from '../../index';
import { Button, Space, Popconfirm } from 'antd';
// import ArrowDown from '../../../components/ArrowDown';
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons';

const CardList = ({
  displayList = [],
  dataIndex,
  children,
  deleteItem,
  copyItem,
  addItem,
  displayType,
}) => {
  const _infoItem = {
    schema: { type: 'object', properties: {} },
    children,
  };

  return (
    <>
      <div className="fr-card-list">
        {displayList.map((item, idx) => {
          return (
            <div
              className={`fr-card-item ${
                displayType === 'row' ? 'fr-card-item-row' : ''
              }`}
              key={idx}
            >
              <div className="fr-card-index">{idx + 1}</div>
              <Core
                displayType={displayType}
                _item={_infoItem}
                dataIndex={[...dataIndex, idx]}
              />

              <Space direction="horizontal" className="fr-card-toolbar">
                <Popconfirm
                  title="确定删除?"
                  onConfirm={() => deleteItem(idx)}
                  okText="确定"
                  cancelText="取消"
                >
                  <DeleteOutlined style={{ fontSize: 17, marginLeft: 8 }} />
                </Popconfirm>
                <CopyOutlined
                  style={{ fontSize: 16, marginLeft: 8 }}
                  onClick={() => copyItem(idx)}
                />
              </Space>
            </div>
          );
        })}
      </div>
      <Button
        style={{ marginTop: displayList.length > 0 ? 0 : 8 }}
        type="dashed"
        onClick={addItem}
      >
        新增一条
      </Button>
    </>
  );
};

export default CardList;
