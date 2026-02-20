/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */
import { Alignment, Button, Navbar, NavbarGroup, NavbarHeading } from "@blueprintjs/core";
import * as React from "react";

export interface IHeaderProps {
    createNewRecipe: () => void;
}

export class Header extends React.PureComponent<IHeaderProps> {
    public render() {
        const { createNewRecipe } = this.props;
        return (
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavbarHeading>Conjure Recipe</NavbarHeading>
                </NavbarGroup>
                <NavbarGroup align={Alignment.RIGHT}>
                    <Button icon="plus" onClick={createNewRecipe}>
                        Create new recipe
                    </Button>
                </NavbarGroup>
            </Navbar>
        );
    }
}
