import Ansi from 'ansi-to-html';
import hasAnsi from 'has-ansi';

let vm;
let ansi;
let model;
let resource;
let container;
let $timeout;
let $sce;
let $compile;
let $scope;
let $q;

const record = {};

let parent = null;
let cache = [];
let buffer = [];

const SCROLL_BUFFER = 250;
const SCROLL_LOAD_DELAY = 50;
const EVENT_START_TASK = 'playbook_on_task_start';
const EVENT_START_PLAY = 'playbook_on_play_start';
const EVENT_STATS_PLAY = 'playbook_on_stats';
const ELEMENT_TBODY = '#atStdoutResultTable';
const ELEMENT_CONTAINER = '.at-Stdout-container';
const JOB_START = 'playbook_on_start';
const JOB_END = 'playbook_on_stats';

const EVENT_GROUPS = [
    EVENT_START_TASK,
    EVENT_START_PLAY
];

const TIME_EVENTS = [
    EVENT_START_TASK,
    EVENT_START_PLAY,
    EVENT_STATS_PLAY
];

function JobsIndexController (
    _resource_,
    webSocketNamespace,
    _$sce_,
    _$timeout_,
    _$scope_,
    _$compile_,
    _$q_
) {
    vm = this || {};

    $timeout = _$timeout_;
    $sce = _$sce_;
    $compile = _$compile_;
    $scope = _$scope_;
    $q = _$q_;
    resource = _resource_;
    model = resource.model;

    ansi = new Ansi();

    const events = model.get(`related.${resource.related}.results`);
    const parsed = parseEvents(events);
    const html = $sce.trustAsHtml(parsed.html);

    cache.push({ page: 1, lines: parsed.lines });

    // Development helper(s)
    vm.clear = devClear;

    // Stdout Navigation
    vm.scroll = {
        isLocked: false,
        showBackToTop: false,
        isActive: false,
        home: scrollHome,
        end: scrollEnd,
        down: scrollPageDown,
        up: scrollPageUp
    };

    // Expand/collapse
    vm.toggle = toggle;
    vm.expand = expand;
    vm.isExpanded = true;

    // Real-time (active between JOB_START and JOB_END events only)
    $scope.$on(webSocketNamespace, processWebSocketEvents);
    vm.stream = {
        isActive: false,
        isRendering: false,
        count: 0,
        page: 1
    };

    window.requestAnimationFrame(() => {
        const table = $(ELEMENT_TBODY);
        container = $(ELEMENT_CONTAINER);

        table.html($sce.getTrustedHtml(html));
        $compile(table.contents())($scope);

        container.scroll(onScroll);
    });
}

function processWebSocketEvents (scope, data) {
    vm.scroll.isActive = true;

    if (data.event === JOB_START) {
        vm.stream.isActive = true;
        vm.scroll.isLocked = true;
    } else if (data.event === JOB_END) {
        vm.stream.isActive = false;
    }

    if (vm.stream.count % resource.page.size === 0) {
        cache.push({
            page: vm.stream.page
        });

        vm.stream.page++;
    }

    vm.stream.count++;
    buffer.push(data);

    if (vm.stream.isRendering) {
        return;
    }

    vm.stream.isRendering = true;

    const events = buffer.slice(0, buffer.length);

    buffer = [];

    return render(events);
}

function render (events) {
    return shift()
        .then(() => append(events))
        .then(() => {
            if (vm.scroll.isLocked) {
                const height = container[0].scrollHeight;
                container[0].scrollTop = height; 
            }

            if (!vm.stream.isActive) {
                if (buffer.length) {
                    events = buffer.slice(0, buffer.length);
                    buffer = [];

                    return render(events)
                        .then(() => {
                            vm.stream.isRendering = false;
                            vm.scroll.isLocked = false;
                            vm.scroll.isActive = false;
                        });
                }
            } else {
                vm.stream.isRendering = false;
            }
        });
}

function devClear () {
    cache = [];
    clear();
}

function next () {
    const config = {
        related: resource.related,
        page: cache[cache.length - 1].page + 1,
        params: {
            order_by: 'start_line'
        }
    };

    // console.log('[2] getting next page', config.page, cache);
    return model.goToPage(config)
        .then(data => {
            if (!data || !data.results) {
                return $q.resolve();
            }

            cache.push({
                page: data.page
            });

            return shift()
                .then(() => append(data.results));
        });
}

function prev () {
    const container = $(ELEMENT_CONTAINER)[0];

    const config = {
        related: resource.related,
        page: cache[0].page - 1,
        params: {
            order_by: 'start_line'
        }
    };

    // console.log('[2] getting previous page', config.page, cache);
    return model.goToPage(config)
        .then(data => {
            if (!data || !data.results) {
                return $q.resolve();
            }

            cache.unshift({
                page: data.page
            });

            const previousHeight = container.scrollHeight;

            return pop()
                .then(() => prepend(data.results))
                .then(lines => {
                    const currentHeight = container.scrollHeight;

                    container.scrollTop = currentHeight - previousHeight;
                });
        });
}

function append (events) {
    // console.log('[4] appending next page');
    return $q(resolve => {
        window.requestAnimationFrame(() => {
            const parsed = parseEvents(events);
            const rows = $($sce.getTrustedHtml($sce.trustAsHtml(parsed.html)));
            const table = $(ELEMENT_TBODY);
            const index = cache.length - 1;

            if (cache[index].lines) {
                cache[index].lines += parsed.lines;
            } else {
                cache[index].lines = parsed.lines;
            }

            table.append(rows);
            $compile(rows.contents())($scope);

            return resolve();
        });
    });
}

function prepend (events) {
    // console.log('[4] prepending next page');

    return $q(resolve => {
        window.requestAnimationFrame(() => {
            const parsed = parseEvents(events);
            const rows = $($sce.getTrustedHtml($sce.trustAsHtml(parsed.html)));
            const table = $(ELEMENT_TBODY);

            cache[0].lines = parsed.lines;

            table.prepend(rows);
            $compile(rows.contents())($scope);

            return resolve(parsed.lines);
        });
    });
}

function pop () {
    // console.log('[3] popping old page');
    return $q(resolve => {
        if (cache.length <= resource.page.limit) {
            // console.log('[3.1] nothing to pop');
            return resolve();
        }

        window.requestAnimationFrame(() => {
            const ejected = cache.pop();
            // console.log('[3.1] popping', ejected);
            const rows = $(ELEMENT_TBODY).children().slice(-ejected.lines);

            rows.empty();
            rows.remove();

            return resolve(ejected);
        });
    });
}

function shift () {
    // console.log('[3] shifting old page');
    return $q(resolve => {
        if (cache.length <= resource.page.limit) {
            // console.log('[3.1] nothing to shift');
            return resolve();
        }

        window.requestAnimationFrame(() => {
            const ejected = cache.shift();
            // console.log('[3.1] shifting', ejected);
            const rows = $(ELEMENT_TBODY).children().slice(0, ejected.lines);

            rows.empty();
            rows.remove();

            return resolve();
        });
    });
}

function clear () {
    // console.log('[3] clearing pages');
    return $q(resolve => {
        window.requestAnimationFrame(() => {
            const rows = $(ELEMENT_TBODY).children();

            rows.empty();
            rows.remove();

            return resolve();
        });
    });
}

function expand () {
    vm.toggle(parent, true);
}

function parseEvents (events) {
    let lines = 0;
    let html = '';

    events.sort(orderByLineNumber);

    events.forEach(event => {
        const line = parseLine(event);

        html += line.html;
        lines += line.count;
    });

    return {
        html,
        lines
    };
}

function orderByLineNumber (a, b) {
    if (a.start_line > b.start_line) {
        return 1;
    }

    if (a.start_line < b.start_line) {
        return -1;
    }

    return 0;
}

function parseLine (event) {
    if (!event || !event.stdout) {
        return { html: '', count: 0 };
    }

    const { stdout } = event;
    const lines = stdout.split('\r\n');

    let count = lines.length;
    let ln = event.start_line;

    const current = createRecord(ln, lines, event);

    const html = lines.reduce((html, line, i) => {
        ln++;

        const isLastLine = i === lines.length - 1;
        let row = createRow(current, ln, line);

        if (current && current.isTruncated && isLastLine) {
            row += createRow(current);
            count++;
        }

        return `${html}${row}`;
    }, '');

    return { html, count };
}

function createRecord (ln, lines, event) {
    if (!event.uuid) {
        return null;
    }

    const info = {
        id: event.id,
        line: ln + 1,
        uuid: event.uuid,
        level: event.event_level,
        start: event.start_line,
        end: event.end_line,
        isTruncated: (event.end_line - event.start_line) > lines.length,
        isHost: typeof event.host === 'number'
    };

    if (event.parent_uuid) {
        info.parents = getParentEvents(event.parent_uuid);
    }

    if (info.isTruncated) {
        info.truncatedAt = event.start_line + lines.length;
    }

    if (EVENT_GROUPS.includes(event.event)) {
        info.isParent = true;

        if (event.event_level === 1) {
            parent = event.uuid;
        }

        if (event.parent_uuid) {
            if (record[event.parent_uuid]) {
                if (record[event.parent_uuid].children &&
                    !record[event.parent_uuid].children.includes(event.uuid)) {
                    record[event.parent_uuid].children.push(event.uuid);
                } else {
                    record[event.parent_uuid].children = [event.uuid];
                }
            }
        }
    }

    if (TIME_EVENTS.includes(event.event)) {
        info.time = getTime(event.created);
        info.line++;
    }

    record[event.uuid] = info;

    return info;
}

function getParentEvents (uuid, list) {
    list = list || [];

    if (record[uuid]) {
        list.push(uuid);

        if (record[uuid].parents) {
            list = list.concat(record[uuid].parents);
        }
    }

    return list;
}

function createRow (current, ln, content) {
    let id = '';
    let timestamp = '';
    let tdToggle = '';
    let tdEvent = '';
    let classList = '';

    content = content || '';

    if (hasAnsi(content)) {
        content = ansi.toHtml(content);
    }

    if (current) {
        if (current.isParent && current.line === ln) {
            id = current.uuid;
            tdToggle = `<td class="at-Stdout-toggle" ng-click="vm.toggle('${id}')"><i class="fa fa-angle-down can-toggle"></i></td>`;
        }

        if (current.isHost) {
            tdEvent = `<td class="at-Stdout-event--host" ng-click="vm.showHostDetails('${current.id}')">${content}</td>`;
        }

        if (current.time && current.line === ln) {
            timestamp = `<span>${current.time}</span>`;
        }

        if (current.parents) {
            classList = current.parents.reduce((list, uuid) => `${list} child-of-${uuid}`, '');
        }
    }

    if (!tdEvent) {
        tdEvent = `<td class="at-Stdout-event">${content}</td>`;
    }

    if (!tdToggle) {
        tdToggle = '<td class="at-Stdout-toggle"></td>';
    }

    if (!ln) {
        ln = '...';
    }

    return `
        <tr id="${id}" class="${classList}">
            ${tdToggle}
            <td class="at-Stdout-line">${ln}</td>
            ${tdEvent}
            <td class="at-Stdout-time">${timestamp}</td>
        </tr>`;
}

function getTime (created) {
    const date = new Date(created);
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

    return `${hour}:${minute}:${second}`;
}

function showHostDetails (id) {
    jobEvent.request('get', id)
        .then(() => {
            const title = jobEvent.get('host_name');

            vm.host = {
                menu: true,
                stdout: jobEvent.get('stdout')
            };

            $scope.jobs.modal.show(title);
        });
}

function toggle (uuid, menu) {
    const lines = $(`.child-of-${uuid}`);
    let icon = $(`#${uuid} .at-Stdout-toggle > i`);

    if (menu || record[uuid].level === 1) {
        vm.isExpanded = !vm.isExpanded;
    }

    if (record[uuid].children) {
        icon = icon.add($(`#${record[uuid].children.join(', #')}`).find('.at-Stdout-toggle > i'));
    }

    if (icon.hasClass('fa-angle-down')) {
        icon.addClass('fa-angle-right');
        icon.removeClass('fa-angle-down');

        lines.addClass('hidden');
    } else {
        icon.addClass('fa-angle-down');
        icon.removeClass('fa-angle-right');

        lines.removeClass('hidden');
    }
}

function onScroll () {
    if (vm.scroll.isActive) {
        return;
    }

    vm.scroll.isActive = true;

    $timeout(() => {
        const top = container[0].scrollTop;
        const bottom = top + SCROLL_BUFFER + container[0].offsetHeight;

        if (top <= SCROLL_BUFFER) {
            // console.log('[1] scroll to top');
            vm.scroll.showBackToTop = false;

            prev()
                .then(() => {
                    // console.log('[5] scroll reset');
                    vm.scroll.isActive = false;
                });

            return;
        } else {
            vm.scroll.showBackToTop = true;

            if (bottom >= container[0].scrollHeight) {
                // console.log('[1] scroll to bottom');

                next()
                    .then(() => {
                        // console.log('[5] scroll reset');
                        vm.scroll.isActive = false;
                    });
            } else {
                vm.scroll.isActive = false;
            }
        }
    }, SCROLL_LOAD_DELAY);
}

function scrollHome () {
    const config = {
        related: resource.related,
        page: 'first',
        params: {
            order_by: 'start_line'
        }
    };

    vm.scroll.isActive = true;

    // console.log('[2] getting first page', config.page, cache);
    return model.goToPage(config)
        .then(data => {
            if (!data || !data.results) {
                return $q.resolve();
            }

            cache = [{
                page: data.page
            }]

            return clear()
                .then(() => prepend(data.results))
                .then(() => {
                    vm.scroll.isActive = false;
                });
        });
}

function scrollEnd () {
    if (vm.scroll.isLocked) {
        vm.scroll.isLocked = false;

        return;
    }

    const config = {
        related: resource.related,
        page: 'last',
        params: {
            order_by: 'start_line'
        }
    };

    vm.scroll.isActive = true;

    // console.log('[2] getting last page', config.page, cache);
    return model.goToPage(config)
        .then(data => {
            if (!data || !data.results) {
                return $q.resolve();
            }

            cache = [{
                page: data.page
            }]

            return clear()
                .then(() => append(data.results))
                .then(() => {
                    const container = $(ELEMENT_CONTAINER)[0];

                    container.scrollTop = container.scrollHeight;
                    vm.scroll.isActive = false;
                });
        });
}

function scrollPageUp () {
    const container = $(ELEMENT_CONTAINER)[0];
    const jump = container.scrollTop - container.offsetHeight;

    container.scrollTop = jump;
}

function scrollPageDown () {
    const container = $(ELEMENT_CONTAINER)[0];
    const jump = container.scrollTop + container.offsetHeight;

    container.scrollTop = jump;
}

JobsIndexController.$inject = [
    'resource',
    'webSocketNamespace',
    '$sce',
    '$timeout',
    '$scope',
    '$compile',
    '$q'
];

module.exports = JobsIndexController;
