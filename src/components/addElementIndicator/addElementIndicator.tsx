/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import "./addElementIndicator.css";

import { Icon, IconName } from "@blueprintjs/core";
import * as classNames from "classnames";
import * as React from "react";

interface IAddElementIndicatorProps {
    className?: string;
    icon: IconName;
    onClick: () => void;
}

export class AddElementIndicator extends React.PureComponent<IAddElementIndicatorProps> {
    public render() {
        const { onClick, icon, className } = this.props;
        return (
            <div className={classNames("rp-add-element-indicator", className)} onClick={onClick}>
                <div className="accent-line" />
                <div>
                    <Icon icon={icon} />
                </div>
                <div className="accent-line" />
            </div>
        );
    }
}
