AWX UI
==

## Getting Started

Node.js and npm are required to build the UI.

* Node.js v6.x LTS (Boron)
* npm v3.10.10

NOTE: npm is bundled with Node.js. Visit [nodejs.org](https://nodejs.org/en/download/) for platform 
specific installation instructions.

#### Building

**Build Once**:

* `make ui`

Navigate to [https://localhost:8043](https://localhost:8043).

NOTE: You will see a certificate warning from your browser.

**Build & Watch**:

From the context of `awx/ui`:

* `npm i`
* `npm run watch`

Navigate to [http://localhost:3000](http://localhost:3000).

NOTE: API requests are proxied to [https://localhost:8043](https://localhost:8043) by default.

#### Linting

* `npm run jshint`

#### Unit Tests

* `npm test -- --single-run`

#### E2E Tests

The E2E tests need a user to login with and some data:

```
docker exec -i tools_awx_1 sh <<-EOSH
  awx-manage createsuperuser --noinput --username=awx-e2e --email=a@wx.com
  awx-manage update_password --username=awx-e2e --password=password
  make --directory=/awx_devel DATA_GEN_PRESET=e2e bulk_data
EOSH
```

After the above commands are finished:

* `npm run e2e`

NOTE: The API server needs to be running for these tests to function.

## Active Development

View the [GitHub issues with the "component:ui" label](https://github.com/ansible/awx/issues?q=is%3Aopen+is%3Aissue+label%3Acomponent%3Aui0)
to see UI-specific features and bugs on our radar. The "state:<type>" labels indicate the current
status of the issue.

For more information on getting involved, review the following:

* [Contributing Guide](https://github.com/ansible/awx/blob/devel/CONTRIBUTING.md)
* [Issues Guide](https://github.com/ansible/awx/blob/devel/ISSUES.md)
* [Code of Conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html)
