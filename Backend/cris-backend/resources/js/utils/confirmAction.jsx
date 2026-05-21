import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

export function confirmAction({ title, content, okText = 'Confirm', danger = false, onOk }) {
    Modal.confirm({
        title,
        icon: <ExclamationCircleOutlined />,
        content,
        okText,
        cancelText: 'Cancel',
        okButtonProps: danger ? { danger: true } : undefined,
        onOk,
    });
}
