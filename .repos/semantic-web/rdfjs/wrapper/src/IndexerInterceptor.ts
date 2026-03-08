export class IndexerInterceptor<T> implements ProxyHandler<T[]> {
    get(target: T[], property: string | symbol, receiver: any): T | undefined {
        if (notNumeric(property)) {
            return Reflect.get(target, property, receiver)
        }

        return target.at(Number.parseInt(property))
    }

    set(target: T[], property: string | symbol, value: T, receiver: any): boolean {
        if (notNumeric(property)) {
            return Reflect.set(target, property, value, receiver)
        }

        const i = Number.parseInt(property)
        target.fill(value, i, i + 1)
        return true
    }

    deleteProperty(target: T[], property: string | symbol): boolean {
        if (notNumeric(property)) {
            return Reflect.deleteProperty(target, property)
        }

        // Elements in this array cannot be deleted because the underlying RDF Collection does not support sparse arrays
        return false
    }
}

function notNumeric(property: string | symbol): property is symbol {
    // TODO: Decide properly
    return typeof property === "symbol" || isNaN(parseInt(property))
}
