
app.components.todo = class extends app.AlpineComponent {

    newTask = ''
    tasks = []

    add() {
       if (this.newTask.trim()) {
           this.tasks.push({ descr: this.newTask, done: false });
           this.newTask = '';
        }
    }

    toggle(task) {
       task.done = !task.done;
    }

    remove(index) {
       this.tasks.splice(index, 1);
    }
}
