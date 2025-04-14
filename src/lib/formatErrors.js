function issueMapper(issue) {
    return issue.message;
}
function isZodIssue(error) {
    return error.code !== undefined;
}
function getNormalizedPathArray(issue) {
    var _a;
    if (typeof issue.path === 'object') {
        return (_a = issue.path) === null || _a === void 0 ? void 0 : _a.map((item) => (typeof item === 'object' ? item.key : item));
    }
    return issue.path;
}
export function formatErrorsToZodFormattedError(issues) {
    const fieldErrors = { _errors: [] };
    function processIssue(issue) {
        var _a;
        // Handle zod only issue types
        if (isZodIssue(issue)) {
            if (issue.code === 'invalid_union') {
                issue.unionErrors.map(processIssue);
                return;
            }
            if (issue.code === 'invalid_return_type') {
                processIssue(issue.returnTypeError);
                return;
            }
            if (issue.code === 'invalid_arguments') {
                processIssue(issue.argumentsError);
                return;
            }
        }
        // Issue without path gets added to the root
        if (issue.path == null || ((_a = issue.path) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            fieldErrors._errors.push(issueMapper(issue));
            return;
        }
        // Issue with path gets added to the correct field
        const normalizedPath = getNormalizedPathArray(issue);
        let curr = fieldErrors;
        let i = 0;
        while (i < normalizedPath.length) {
            const el = normalizedPath[i];
            const terminal = i === normalizedPath.length - 1;
            if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
            }
            else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(issueMapper(issue));
            }
            curr = curr[el];
            i++;
        }
    }
    for (const issue of issues) {
        processIssue(issue);
    }
    return fieldErrors;
}
