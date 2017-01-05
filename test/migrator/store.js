
export default class Store {
  constructor() {
    let version;

    this.setVersion = (id) => {
      version = id === undefined ? undefined : id;
    };

    this.getVersion = () => version;
  }
}
