let BaseModel;

function JobModel (method, resource, config) {
    BaseModel.call(this, 'jobs');

    this.Constructor = JobModel;

    return this.create(method, resource, config);
}

function JobModelLoader (_BaseModel_) {
    BaseModel = _BaseModel_;

    return JobModel;
}

JobModelLoader.$inject = [
    'BaseModel'
];

export default JobModelLoader;
