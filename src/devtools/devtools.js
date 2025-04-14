import { setupDevtoolsPlugin } from '@vue/devtools-api';
import { getCurrentInstance, nextTick, onUnmounted, ref, watch, } from 'vue';
import { throttle } from '../utils';
import { buildFieldState, buildFormState, } from './devtoolsBuilder';
let API;
const INSPECTOR_ID = 'formango-inspector';
const DEVTOOLS_FORMS = ref({});
const DEVTOOLS_FIELDS = ref({});
const COLORS = {
    black: 0,
    blue: 218007,
    error: 12405579,
    gray: 12304330,
    orange: 16099682,
    purple: 12157168,
    success: 448379,
    unknown: 5522283,
    white: 16777215,
};
let IS_INSTALLED = false;
function mapFieldsToObject(fields) {
    const obj = {};
    for (const field of fields) {
        if (!field._path) {
            continue;
        }
        const path = field._path;
        const pathArray = path === null || path === void 0 ? void 0 : path.split('.');
        if (!pathArray) {
            continue;
        }
        const lastKey = pathArray.pop();
        const lastObj = pathArray.reduce((obj, key) => obj[key] = obj[key] || {}, obj);
        if (!lastObj[lastKey]) {
            lastObj[lastKey] = {};
        }
        lastObj[lastKey].__FIELD__ = field;
    }
    return obj;
}
// recursively map the mappedObjects to a CustomInspectorNode
let nonFieldsCounter = 0;
function mapObjectToCustomInspectorNode(obj) {
    return Object.keys(obj).map((key) => {
        const value = obj[key];
        if (value.__FIELD__) {
            const field = value.__FIELD__;
            const hasError = field.errors && Object.values(field.errors).length > 0;
            const validTag = {
                backgroundColor: hasError ? COLORS.error : COLORS.success,
                label: hasError ? 'Invalid' : 'Valid',
                textColor: COLORS.white,
            };
            const tags = [];
            if (hasError) {
                tags.push(validTag);
            }
            delete value.__FIELD__;
            return {
                id: field.__ID__,
                label: key,
                tags,
                children: mapObjectToCustomInspectorNode(value),
            };
        }
        else {
            nonFieldsCounter++;
            return {
                id: `non-field-${nonFieldsCounter}`,
                label: key,
                tags: [
                    {
                        backgroundColor: COLORS.orange,
                        label: 'Not registered',
                        textColor: COLORS.white,
                    },
                ],
                children: mapObjectToCustomInspectorNode(value),
            };
        }
    });
}
function calculateNodes() {
    nonFieldsCounter = 0;
    return Object.keys(DEVTOOLS_FORMS.value).map((formId) => {
        const form = DEVTOOLS_FORMS.value[formId];
        const actualForm = form.form;
        const foundFieldKeys = Object.keys(DEVTOOLS_FIELDS.value).filter((key) => {
            const field = DEVTOOLS_FIELDS.value[key];
            return form.form._id === field.formId;
        });
        const allFormFields = foundFieldKeys.map((key) => {
            const field = DEVTOOLS_FIELDS.value[key];
            field.field.__ID__ = key;
            return field.field;
        });
        const mappedAsObject = mapFieldsToObject(allFormFields);
        const formChildren = mapObjectToCustomInspectorNode(mappedAsObject);
        const validTag = {
            backgroundColor: actualForm.isValid ? COLORS.success : COLORS.error,
            label: actualForm.isValid ? 'Valid' : 'Invalid',
            textColor: COLORS.white,
        };
        return {
            id: formId,
            label: `${form.name}`,
            tags: [
                validTag,
            ],
            children: formChildren,
        };
    });
}
export const refreshInspector = throttle(() => {
    setTimeout(async () => {
        await nextTick();
        API === null || API === void 0 ? void 0 : API.sendInspectorState(INSPECTOR_ID);
        API === null || API === void 0 ? void 0 : API.sendInspectorTree(INSPECTOR_ID);
    }, 100);
}, 100);
const isDevMode = process.env.NODE_ENV === 'development';
function installDevtoolsPlugin(app) {
    if (!isDevMode) {
        return;
    }
    setupDevtoolsPlugin({
        id: 'formango-devtools-plugin',
        app,
        homepage: 'https://github.com/wisemen-digital/vue-formango',
        label: 'Formango Plugin',
        logo: 'https://wisemen-digital.github.io/vue-formango/assets/mango_no_shadow.svg',
        packageName: 'formango',
    }, setupApiHooks);
}
function setupApiHooks(api) {
    API = api;
    api.addInspector({
        id: INSPECTOR_ID,
        icon: 'rule',
        label: 'formango',
        noSelectionText: 'Select a form node to inspect',
    });
    api.on.getInspectorTree((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) {
            return;
        }
        try {
            const calculatedNodes = calculateNodes();
            payload.rootNodes = calculatedNodes;
        }
        catch (error) {
            console.error('Error with calculating devtools nodes');
            console.error(error);
        }
    });
    api.on.getInspectorState((payload) => {
        var _a;
        if (payload.inspectorId !== INSPECTOR_ID) {
            return;
        }
        const decodedNode = decodeNodeId(payload.nodeId);
        if ((decodedNode === null || decodedNode === void 0 ? void 0 : decodedNode.type) === 'form' && (decodedNode === null || decodedNode === void 0 ? void 0 : decodedNode.form)) {
            payload.state = buildFormState(decodedNode.form);
        }
        else if ((decodedNode === null || decodedNode === void 0 ? void 0 : decodedNode.type) === 'field' && ((_a = decodedNode === null || decodedNode === void 0 ? void 0 : decodedNode.field) === null || _a === void 0 ? void 0 : _a.field)) {
            payload.state = buildFieldState(decodedNode === null || decodedNode === void 0 ? void 0 : decodedNode.field.field);
        }
    });
}
function installPlugin() {
    if (!isDevMode) {
        return;
    }
    const vm = getCurrentInstance();
    if (!IS_INSTALLED) {
        IS_INSTALLED = true;
        const app = vm === null || vm === void 0 ? void 0 : vm.appContext.app;
        if (!app) {
            return;
        }
        installDevtoolsPlugin(app);
    }
}
export function registerFormWithDevTools(form, name) {
    var _a;
    if (!isDevMode) {
        return;
    }
    installPlugin();
    if (!(form === null || form === void 0 ? void 0 : form._id)) {
        return;
    }
    // get component name from the instance
    const componentName = (_a = getCurrentInstance()) === null || _a === void 0 ? void 0 : _a.type.__name;
    const encodedForm = encodeNodeId({
        id: form._id,
        name: name !== null && name !== void 0 ? name : 'Unknown form',
        type: 'form',
    });
    DEVTOOLS_FORMS.value[encodedForm] = {
        name: componentName !== null && componentName !== void 0 ? componentName : 'Unknown form',
        form,
    };
    onUnmounted(() => {
        const formFields = Object.keys(DEVTOOLS_FIELDS.value).filter((fieldId) => {
            const field = DEVTOOLS_FIELDS.value[fieldId];
            return field.formId === (form === null || form === void 0 ? void 0 : form._id);
        });
        delete DEVTOOLS_FORMS.value[encodedForm];
        // eslint-disable-next-line unicorn/no-array-for-each
        formFields.forEach((formFieldId) => {
            delete DEVTOOLS_FIELDS.value[formFieldId];
        });
    });
}
export function registerFieldWithDevTools(formId, field) {
    if (!isDevMode) {
        return;
    }
    installPlugin();
    const encodedField = encodeNodeId({
        id: field._id,
        type: 'field',
    });
    DEVTOOLS_FIELDS.value[encodedField] = {
        formId,
        field,
    };
}
export function unregisterFieldWithDevTools(fieldId) {
    if (!isDevMode) {
        return;
    }
    const encodedField = encodeNodeId({
        id: fieldId,
        type: 'field',
    });
    delete DEVTOOLS_FIELDS.value[encodedField];
}
function encodeNodeId(node) {
    return btoa(encodeURIComponent(JSON.stringify(node)));
}
function decodeNodeId(nodeId) {
    try {
        const decodedNode = JSON.parse(decodeURIComponent(atob(nodeId)));
        if (!decodedNode) {
            throw new Error('Invalid node id');
        }
        if (decodedNode.type === 'form' && DEVTOOLS_FORMS.value[nodeId]) {
            return {
                name: decodedNode.name,
                form: DEVTOOLS_FORMS.value[nodeId].form,
                type: 'form',
            };
        }
        else {
            return {
                field: DEVTOOLS_FIELDS.value[nodeId],
                type: 'field',
            };
        }
    }
    catch (_a) {
        // console.error(`Devtools: [vee-validate] Failed to parse node id ${nodeId}`);
    }
    return null;
}
if (isDevMode) {
    watch([
        DEVTOOLS_FORMS.value,
        DEVTOOLS_FIELDS.value,
    ], refreshInspector, { deep: true });
}
