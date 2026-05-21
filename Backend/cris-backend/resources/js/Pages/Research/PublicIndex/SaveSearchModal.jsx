import { Input, Modal } from 'antd';

export default function SaveSearchModal({ open, name, onNameChange, onCancel, onOk }) {
    return (
        <Modal
            title="Save Search"
            open={open}
            onCancel={onCancel}
            onOk={onOk}
            okText="Save"
            okButtonProps={{ disabled: !name.trim() }}
        >
            <label
                htmlFor="saved-search-name"
                className="mb-2 block text-xs font-medium text-slate-500"
            >
                Search Name
            </label>
            <Input
                id="saved-search-name"
                value={name}
                maxLength={80}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="My saved search"
                onPressEnter={() => {
                    if (name.trim()) onOk();
                }}
            />
        </Modal>
    );
}
