import { action, computed, observable } from "mobx"

class Doubler {
    @observable accessor value: number;

    constructor(value: number) {
        this.value = value
    }

    @computed
    get double() {
        return this.value * 2
    }

    @action
    increment() {
        this.value++
    }
}