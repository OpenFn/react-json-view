import React from 'react';

import { toType } from './../helpers/util';

//clibboard icon
import { Clippy } from './icons';

//theme
import Theme from './../themes/getStyle';

export default class extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            copiedPath: false
        };
    }

    copiedTimer = null;

    componentWillUnmount() {
        if (this.copiedTimer) {
            clearTimeout(this.copiedTimer);
            this.copiedTimer = null;
        }
    }

    getPath = (namespace) => {
       const root = namespace[0];
       const tail = namespace.slice(1,);
       const path = `['${tail?.join("']['")}']`;

       return (tail?.length > 0 ? root + path : root)
      }

    copy =  (copyText)  =>{
      const container = document.createElement('textarea');
      container.innerHTML = copyText;

      document.body.appendChild(container);
      container.select();
      document.execCommand('copy');

      document.body.removeChild(container);

      this.copiedTimer = setTimeout(() => {
          this.setState({
              copiedPath: false
          });
      }, 1000);

    }

    updateCopyState = ({src,namespace,name,path}) => {
      const {clickCallback}  = this.props;

      this.setState({ copiedPath: true }, () => {
         if (typeof clickCallback !== 'function') {
             return;
         }

         clickCallback({
             src,
             namespace,
             name,
             path
         });
     });
    }

    defaultCopyPath = ({src, namespace}) => {
      const name =  namespace[namespace.length - 1];
      const path = this.getPath(namespace);

      this.copy(path);

      this.updateCopyState(
         {
            src,
            namespace,
            name,
            path
         });     
    }

    customCopyPath = ({src, namespace}, callback) => {
      const name =  namespace[namespace.length - 1];
      const path = callback({src, namespace, name});

      this.copy(path);

      this.updateCopyState(
         {
            src,
            namespace,
            name,
            path
         });     
    }

    handleCopy = () => {
       const {src, namespace } = this.props;
       const {onCustomPath} = this.props;

       if (typeof onCustomPath !== 'function') {
         return this.defaultCopyPath({src, namespace})
      } else {
         return this.customCopyPath({src,namespace}, onCustomPath)
      }
    };

    getClippyIcon = () => {
        const { theme } = this.props;

        if (this.state.copiedPath) {
            return (
                <span>
                    <Clippy class="copy-icon" {...Theme(theme, 'copy-icon')} />
                    <span {...Theme(theme, 'copy-icon-copied')}>✔</span>
                </span>
            );
        }

        return <Clippy class="copy-icon" {...Theme(theme, 'copy-icon')} />;
    };

    clipboardValue = value => {
        const type = toType(value);
        switch (type) {
            case 'function':
            case 'regexp':
                return value.toString();
            default:
                return value;
        }
    };

    render() {
        const { theme, hidden, rowHovered, copyPathLabel } = this.props;
        let style = Theme(theme, 'copy-to-clipboard').style;
        let display = 'inline';

        if (hidden) {
            display = 'none';
        }

        return (
            <span
                className="copy-to-clipboard-container"
                title={copyPathLabel}
                style={{
                    verticalAlign: 'top',
                    display: rowHovered ? 'inline-block' : 'none'
                }}
            >
                <span
                    style={{
                        ...style,
                        display: display
                    }}
                    onClick={this.handleCopy}
                >
                    {this.getClippyIcon()}
                </span>
            </span>
        );
    }
}
