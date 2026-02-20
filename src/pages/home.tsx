import React, { useEffect, useState } from "react";
import { client } from "../utils/client";
import { Country } from "@ontology-starter/sdk/ontology/objects";
import { ErrorVisitor, ListObjectsError, Result, visitError, isOk, isErr, Page } from "@ontology-starter/sdk";

import "./home.scss";

export const HomePage: React.FC = () => {
    const [objectList, setObjectList] = useState<
        { status: "loading" } | { status: "loaded"; value: Country[] } | { status: "failed_loading"; msg: string }
    >({ status: "loading" });

    const getData = React.useCallback(async () => {
        const result: Result<Page<Country>, ListObjectsError> = await client.ontology.objects.Country.page({
            pageSize: 10,
        });
        if (isOk(result)) {
            setObjectList({ value: result.value.data, status: "loaded" });
        } else if (isErr(result)) {
            const visitor: ErrorVisitor<ListObjectsError, void> = {
                ObjectTypeNotFound: err => {
                    setObjectList({ status: "failed_loading", msg: `Object type ${err.objectType} was not found` });
                },
                default: () => {
                    setObjectList({ status: "failed_loading", msg: "failed loading object type" });
                },
            };
            visitError(result.error, visitor);
        }
    }, []);

    // Do an initial load of all Objects of a particular type
    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div className="home">
            <h1>Hello World!</h1>
            {objectList.status === "loading" && <div>Loading…</div>}
            {objectList.status === "loaded" && (
                <ul>
                    {objectList.value.map(object => (
                        <li key={object.__primaryKey}>{object.countryName}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
