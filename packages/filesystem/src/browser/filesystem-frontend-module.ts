/********************************************************************************
 * Copyright (C) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { FrontendApplicationContribution, LabelProviderContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { CommandContribution, ResourceResolver } from '@theia/core/lib/common';
import { ContainerModule, interfaces } from 'inversify';
import '../../src/browser/style/index.css';
import { FileSystem, fileSystemPath } from '../common';
import { fileSystemWatcherPath, FileSystemWatcherServer, FileSystemWatcherServerProxy, ReconnectingFileSystemWatcherServer } from '../common/filesystem-watcher-protocol';
import { FileResourceResolver } from './file-resource';
import { FileTreeLabelProvider } from './file-tree/file-tree-label-provider';
import { FileUploadService } from './file-upload-service';
import { FileSystemFrontendContribution } from './filesystem-frontend-contribution';
import { bindFileSystemPreferences } from './filesystem-preferences';
import { FileSystemProxyFactory } from './filesystem-proxy-factory';
import { FileSystemWatcher } from './filesystem-watcher';


export default new ContainerModule(bind => {
    bindFileSystemPreferences(bind);

    bind(FileSystemWatcherServerProxy).toDynamicValue(ctx =>
        WebSocketConnectionProvider.createProxy(ctx.container, fileSystemWatcherPath)
    );
    bind(FileSystemWatcherServer).to(ReconnectingFileSystemWatcherServer);
    bind(FileSystemWatcher).toSelf().inSingletonScope();

    bind(FileSystemProxyFactory).toSelf();
    bind(FileSystem).toDynamicValue(ctx => {
        const proxyFactory = ctx.container.get(FileSystemProxyFactory);
        return WebSocketConnectionProvider.createProxy(ctx.container, fileSystemPath, proxyFactory);
    }).inSingletonScope();

    bindFileResource(bind);

    bind(FileUploadService).toSelf().inSingletonScope();

    bind(FileSystemFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(FileSystemFrontendContribution);
    bind(FrontendApplicationContribution).toService(FileSystemFrontendContribution);

    bind(FileTreeLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(FileTreeLabelProvider);
});

export function bindFileResource(bind: interfaces.Bind): void {
    bind(FileResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(FileResourceResolver);
}
