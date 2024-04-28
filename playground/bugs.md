batchUpdate was running on every call from setState.
reason: it was being recreated after each react element re-render, since it was present inside the react component.